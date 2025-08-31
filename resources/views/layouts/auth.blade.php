<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>{{ config('app.name', 'TuVitrina') }} - @yield('title', 'Autenticación')</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .auth-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 1000px;
            width: 100%;
            margin: 20px;
            min-height: 600px;
            display: flex;
        }
        
        .auth-row {
            display: flex;
            width: 100%;
            min-height: 600px;
        }
        
        .auth-col-left {
            flex: 0 0 50%;
            display: flex;
        }
        
        .auth-col-right {
            flex: 0 0 50%;
            display: flex;
        }
        
        .auth-brand {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 3rem;
            text-align: center;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        
        .auth-brand::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="%23ffffff" opacity="0.1"/></svg>') repeat;
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translateX(-50px) translateY(-50px); }
            100% { transform: translateX(50px) translateY(50px); }
        }
        
        .auth-brand h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 2;
        }
        
        .auth-brand p {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .stat-item {
            padding: 1rem 0.5rem;
            position: relative;
            z-index: 2;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            line-height: 1.2;
        }
        
        .auth-form {
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        
        .form-control {
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.25);
        }
        
        .form-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
        }
        
        .auth-links {
            text-align: center;
            margin-top: 2rem;
        }
        
        .auth-links a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .auth-links a:hover {
            color: var(--secondary-color);
            text-decoration: underline;
        }
        
        .invalid-feedback {
            display: block;
            font-size: 0.875rem;
            color: #dc3545;
            margin-top: 0.25rem;
        }
        
        .is-invalid {
            border-color: #dc3545;
        }
        
        .back-to-home {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            font-size: 1.2rem;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .back-to-home:hover {
            color: rgba(255, 255, 255, 0.8);
            transform: translateX(-5px);
        }
        
        @media (max-width: 768px) {
            .auth-container {
                margin: 10px;
                min-height: auto;
            }
            
            .auth-brand {
                padding: 2rem;
                min-height: auto;
            }
            
            .auth-form {
                padding: 2rem;
                min-height: auto;
            }
            
            .auth-brand h1 {
                font-size: 2rem;
            }
            
            .stat-item {
                padding: 0.5rem;
            }
            
            .stat-number {
                font-size: 1.2rem;
            }
            
            .stat-label {
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 992px) {
            .auth-container {
                max-width: 800px;
            }
        }
    </style>
</head>
<body>
    <a href="{{ url('/') }}" class="back-to-home">
        <i class="fas fa-arrow-left me-2"></i>Volver al inicio
    </a>
    
    <div class="auth-container">
        <div class="auth-row">
            <div class="auth-col-left">
                <div class="auth-brand">
                    <h1><i class="fas fa-store me-3"></i>TuVitrina</h1>
                    <p class="mb-4">Tu plataforma digital para mostrar y vender tus productos</p>
                    <div class="row text-center mt-4">
                        <div class="col-4">
                            <div class="stat-item">
                                <i class="fas fa-users fa-2x mb-3"></i>
                                <div class="stat-number">+1000</div>
                                <div class="stat-label">Usuarios</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-item">
                                <i class="fas fa-shopping-bag fa-2x mb-3"></i>
                                <div class="stat-number">+5000</div>
                                <div class="stat-label">Productos</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-item">
                                <i class="fas fa-star fa-2x mb-3"></i>
                                <div class="stat-number">4.9/5</div>
                                <div class="stat-label">Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="auth-col-right">
                <div class="auth-form">
                    @yield('content')
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom Scripts -->
    <script src="{{ asset('js/app.js') }}"></script>
    
    @yield('scripts')
</body>
</html>