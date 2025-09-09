<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TuVitrina - Tu Negocio Online</title>
    
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
        
        .floating {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .promo-badge {
            background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        .stats-counter {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top" style="background: rgba(99, 102, 241, 0.95); backdrop-filter: blur(10px);">
        <div class="container">
            <a class="navbar-brand fw-bold fs-3" href="#">
                <i class="fas fa-store text-warning me-2"></i>TuVitrina
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#inicio">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#caracteristicas">Características</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#precios">Precios</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#testimonios">Testimonios</a>
                    </li>
                    @if (Route::has('login'))
                        @auth
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('/home') }}">Dashboard</a>
                            </li>
                        @else
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('login') }}">Iniciar Sesión</a>
                            </li>
                            @if (Route::has('register'))
                                <li class="nav-item">
                                    <a class="btn btn-warning btn-sm ms-2" href="{{ route('register') }}">Registrarse</a>
                                </li>
                            @endif
                        @endauth
                    @endif
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="hero-bg min-vh-100 d-flex align-items-center position-relative">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 animate-slide-in-left">
                    <div class="promo-badge animate-bounce">
                        🎉 ¡PROMOCIÓN ESPECIAL! Paga 1 mes y obtén 3 meses GRATIS
                    </div>
                    <h1 class="display-3 fw-bold text-white mb-4">
                        Tu Negocio <span class="text-warning">Online</span><br>
                        Empieza Aquí
                    </h1>
                    <p class="lead text-white mb-4">
                        Únete a la vitrina digital más exitosa de México. Registra tu negocio, 
                        sube hasta <strong>30 productos</strong> y comienza a vender online hoy mismo.
                    </p>
                    <div class="d-flex flex-wrap gap-3">
                        <a href="{{ route('register', ['plan' => 'monthly']) }}" class="btn btn-warning btn-lg btn-custom animate-pulse">
                            <i class="fas fa-rocket me-2"></i>Comenzar Ahora
                        </a>
                        <a href="#caracteristicas" class="btn btn-outline-light btn-lg btn-custom">
                            <i class="fas fa-play me-2"></i>Ver Demo
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center animate-slide-in-right">
                    <div class="floating">
                        <i class="fas fa-store-alt" style="font-size: 15rem; color: rgba(255,255,255,0.2);"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Stats Section -->
        <div class="position-absolute bottom-0 w-100 bg-white py-4">
            <div class="container">
                <div class="row text-center">
                    <div class="col-md-3">
                        <div class="stats-counter">500+</div>
                        <p class="text-muted mb-0">Negocios Registrados</p>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-counter">15K+</div>
                        <p class="text-muted mb-0">Productos Vendidos</p>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-counter">98%</div>
                        <p class="text-muted mb-0">Satisfacción</p>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-counter">24/7</div>
                        <p class="text-muted mb-0">Soporte</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="caracteristicas" class="section-padding bg-light">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center mb-5">
                    <h2 class="display-4 fw-bold text-primary-custom mb-4">¿Por qué elegir TuVitrina?</h2>
                    <p class="lead text-muted">La plataforma más completa para hacer crecer tu negocio online</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4 animate-fade-in-up">
                    <div class="card h-100 border-0 card-hover">
                        <div class="card-body text-center p-4">
                            <div class="bg-gradient-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                                <i class="fas fa-store text-white fs-2"></i>
                            </div>
                            <h4 class="fw-bold mb-3">Vitrina Digital</h4>
                            <p class="text-muted">Crea tu tienda online profesional en minutos. Personaliza tu perfil y destaca entre la competencia.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 animate-fade-in-up" style="animation-delay: 0.2s;">
                    <div class="card h-100 border-0 card-hover">
                        <div class="card-body text-center p-4">
                            <div class="bg-gradient-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                                <i class="fas fa-boxes text-white fs-2"></i>
                            </div>
                            <h4 class="fw-bold mb-3">Gestión de Productos</h4>
                            <p class="text-muted">Sube hasta 30 productos con fotos, descripciones y control de inventario en tiempo real.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 animate-fade-in-up" style="animation-delay: 0.4s;">
                    <div class="card h-100 border-0 card-hover">
                        <div class="card-body text-center p-4">
                            <div class="bg-gradient-accent rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                                <i class="fas fa-chart-line text-white fs-2"></i>
                            </div>
                            <h4 class="fw-bold mb-3">Análisis de Ventas</h4>
                            <p class="text-muted">Obtén reportes detallados de tus ventas y conoce mejor a tus clientes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="precios" class="section-padding">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center mb-5">
                    <h2 class="display-4 fw-bold text-primary-custom mb-4">Planes que se Adaptan a Ti</h2>
                    <p class="lead text-muted">Elige el plan perfecto para hacer crecer tu negocio</p>
                </div>
            </div>
            <div class="row justify-content-center g-4">
                <div class="col-lg-5">
                    <div class="pricing-card text-center">
                        <div class="mb-4">
                            <i class="fas fa-rocket text-primary-custom fs-1 mb-3"></i>
                            <h3 class="fw-bold">Plan Mensual</h3>
                            <p class="text-muted">Perfecto para empezar</p>
                        </div>
                        <div class="mb-4">
                            <span class="display-3 fw-bold text-primary-custom">$100</span>
                            <span class="text-muted">/mes</span>
                        </div>
                        <div class="promo-badge mb-4">
                            🎁 ¡PAGA 1 MES Y OBTÉN 3 MESES GRATIS!
                        </div>
                        <ul class="list-unstyled mb-4">
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Vitrina digital personalizada</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Hasta 30 productos</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Gestión de inventario</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Soporte 24/7</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Reportes básicos</li>
                        </ul>
                        <a href="{{ route('register', ['plan' => 'monthly']) }}" class="btn btn-primary-custom btn-custom w-100">
                            <i class="fas fa-credit-card me-2"></i>Comenzar Ahora
                        </a>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="pricing-card featured text-center">
                        <div class="mb-4">
                            <i class="fas fa-crown text-warning fs-1 mb-3"></i>
                            <h3 class="fw-bold">Plan Anual</h3>
                            <p class="text-muted">El más popular</p>
                        </div>
                        <div class="mb-4">
                            <span class="display-3 fw-bold text-primary-custom">$1,000</span>
                            <span class="text-muted">/año</span>
                            <div class="small text-success fw-bold">¡Ahorra $200!</div>
                        </div>
                        <div class="promo-badge mb-4">
                            💎 ¡MEJOR VALOR! Incluye todo
                        </div>
                        <ul class="list-unstyled mb-4">
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Todo del plan mensual</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Hasta 100 productos</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Soporte prioritario</li>
                        </ul>
                        <a href="{{ route('register', ['plan' => 'annual']) }}" class="btn btn-secondary-custom btn-custom w-100">
                            <i class="fas fa-star me-2"></i>¡Quiero Este Plan!
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonios" class="section-padding bg-light">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center mb-5">
                    <h2 class="display-4 fw-bold text-primary-custom mb-4">Clientes Satisfechos</h2>
                    <p class="lead text-muted">Conoce las historias de éxito de nuestros usuarios</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-lg-4 animate-fade-in-up">
                    <div class="testimonial-card">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                                <i class="fas fa-pizza-slice text-white fs-4"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold mb-0">Pizzería Don Luigi</h5>
                                <small class="text-muted">Restaurante</small>
                            </div>
                        </div>
                        <p class="text-muted mb-3">"Desde que usamos TuVitrina, nuestras ventas online aumentaron 300%. La plataforma es súper fácil de usar y nuestros clientes pueden ver nuestro menú completo."</p>
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 animate-fade-in-up" style="animation-delay: 0.2s;">
                    <div class="testimonial-card">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-gradient-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                                <i class="fas fa-tshirt text-white fs-4"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold mb-0">Boutique Eleganza</h5>
                                <small class="text-muted">Moda y Accesorios</small>
                            </div>
                        </div>
                        <p class="text-muted mb-3">"La gestión de inventario es increíble. Puedo controlar mis 30 productos fácilmente y mis clientas aman poder ver toda la colección online."</p>
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 animate-fade-in-up" style="animation-delay: 0.4s;">
                    <div class="testimonial-card">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-gradient-accent rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                                <i class="fas fa-tools text-white fs-4"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold mb-0">Ferretería El Martillo</h5>
                                <small class="text-muted">Herramientas y Construcción</small>
                            </div>
                        </div>
                        <p class="text-muted mb-3">"Perfecto para mi ferretería. Los clientes pueden ver disponibilidad en tiempo real y hacer pedidos. El soporte es excelente."</p>
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-4 mt-4">
                <div class="col-lg-6 animate-fade-in-up" style="animation-delay: 0.6s;">
                    <div class="testimonial-card">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                                <i class="fas fa-birthday-cake text-white fs-4"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold mb-0">Pastelería Dulce Amor</h5>
                                <small class="text-muted">Repostería y Postres</small>
                            </div>
                        </div>
                        <p class="text-muted mb-3">"Mis pasteles personalizados ahora llegan a más clientes. La vitrina digital me ayuda a mostrar mi trabajo y recibir pedidos las 24 horas."</p>
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 animate-fade-in-up" style="animation-delay: 0.8s;">
                    <div class="testimonial-card">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-gradient-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                                <i class="fas fa-mobile-alt text-white fs-4"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold mb-0">TecnoCell Reparaciones</h5>
                                <small class="text-muted">Tecnología y Reparaciones</small>
                            </div>
                        </div>
                        <p class="text-muted mb-3">"Ideal para mi negocio de reparaciones. Los clientes pueden ver mis servicios, precios y agendar citas. ¡Muy recomendado!"</p>
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-gradient-primary text-white text-center">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <h2 class="display-4 fw-bold mb-4">¿Listo para Hacer Crecer tu Negocio?</h2>
                    <p class="lead mb-5">Únete a más de 500 negocios exitosos que ya confían en TuVitrina</p>
                    <div class="d-flex flex-wrap justify-content-center gap-3">
                        <a href="{{ route('register', ['plan' => 'monthly']) }}" class="btn btn-warning btn-lg btn-custom animate-pulse">
                            <i class="fas fa-rocket me-2"></i>Comenzar  Ahora
                        </a>
                        <a href="#precios" class="btn btn-outline-light btn-lg btn-custom">
                            <i class="fas fa-eye me-2"></i>Ver Planes
                        </a>
                    </div>
                    <div class="mt-4">
                        <small class="opacity-75">✅ Sin compromisos • ✅ Soporte 24/7 • ✅ Configuración gratuita</small>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <h5 class="fw-bold mb-3">
                        <i class="fas fa-store text-warning me-2"></i>TuVitrina
                    </h5>
                    <p class="">La plataforma líder para negocios online en México. Haz crecer tu negocio con nosotros.</p>
                    <div class="d-flex gap-3">
                        <a href="#" class="text-warning"><i class="fab fa-facebook fs-4"></i></a>
                        {{-- <a href="#" class="text-warning"><i class="fab fa-instagram fs-4"></i></a>
                        <a href="#" class="text-warning"><i class="fab fa-twitter fs-4"></i></a>
                        <a href="#" class="text-warning"><i class="fab fa-whatsapp fs-4"></i></a> --}}
                    </div>
                </div>
                <div class="col-lg-5 mb-4">

                </div>
                {{-- <div class="col-lg-2 mb-4">
                    <h6 class="fw-bold mb-3">Producto</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class=" text-decoration-none">Características</a></li>
                        <li><a href="#" class=" text-decoration-none">Precios</a></li>
                        <li><a href="#" class=" text-decoration-none">Demo</a></li>
                    </ul>
                </div>
                <div class="col-lg-2 mb-4">
                    <h6 class="fw-bold mb-3">Soporte</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class=" text-decoration-none">Centro de Ayuda</a></li>
                        <li><a href="#" class=" text-decoration-none">Contacto</a></li>
                        <li><a href="#" class=" text-decoration-none">Tutoriales</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 mb-4">
                    <h6 class="fw-bold mb-3">Legal</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class=" text-decoration-none">Términos</a></li>
                        <li><a href="#" class=" text-decoration-none">Privacidad</a></li>
                        <li><a href="#" class=" text-decoration-none">Cookies</a></li>
                    </ul>
                </div> --}}
                <div class="col-lg-2 mb-4">
                    <h6 class="fw-bold mb-3">Contacto</h6>
                    <ul class="list-unstyled ">
                        {{-- <li><i class="fas fa-phone me-2"></i>+52 55 1234 5678</li> --}}
                        <li><i class="fas fa-envelope me-2"></i>hola@tuvitrina.com</li>
                        <li><i class="fas fa-map-marker-alt me-2"></i>Mérida yucatán</li>
                    </ul>
                </div>
            </div>
            <hr class="my-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <p class="text-muted mb-0">&copy; 2024 TuVitrina. Todos los derechos reservados.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="text-muted mb-0">Hecho con ❤️ en México</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="{{ mix('js/app.js') }}"></script>
    <script>
        // Smooth scrolling for anchor links
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

        // Navbar background on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(99, 102, 241, 0.95)';
            } else {
                navbar.style.background = 'rgba(99, 102, 241, 0.95)';
            }
        });

        // Animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    </script>
</body>
</html>
