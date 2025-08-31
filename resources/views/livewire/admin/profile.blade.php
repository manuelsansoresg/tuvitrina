<div>
    <div class="row">
        <div class="col-md-8">
            <!-- Información Personal -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-user me-2"></i>Información Personal
                    </h5>
                </div>
                <div class="card-body">
                    @if (session()->has('message'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <i class="fas fa-check-circle me-2"></i>{{ session('message') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif
                    
                    <form wire:submit.prevent="updateProfile">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="name" class="form-label">Nombre *</label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" wire:model="name" placeholder="Tu nombre">
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="last_name" class="form-label">Apellido *</label>
                                <input type="text" class="form-control @error('last_name') is-invalid @enderror" 
                                       id="last_name" wire:model="last_name" placeholder="Tu apellido">
                                @error('last_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="email" class="form-label">Correo Electrónico *</label>
                                <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                       id="email" wire:model="email" placeholder="tu@email.com">
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="phone" class="form-label">Teléfono</label>
                                <input type="tel" class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" wire:model="phone" placeholder="555-123-4567">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <!-- Formulario de Contraseña (Condicional) -->
                        @if($showPasswordForm)
                            <hr class="my-4">
                            <h6 class="mb-3">
                                <i class="fas fa-lock me-2"></i>Cambiar Contraseña
                            </h6>
                            
                            <div class="row">
                                <div class="col-md-12 mb-3">
                                    <label for="current_password" class="form-label">Contraseña Actual *</label>
                                    <input type="password" class="form-control @error('current_password') is-invalid @enderror" 
                                           id="current_password" wire:model="current_password" placeholder="Tu contraseña actual">
                                    @error('current_password')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="password" class="form-label">Nueva Contraseña *</label>
                                    <input type="password" class="form-control @error('password') is-invalid @enderror" 
                                           id="password" wire:model="password" placeholder="Nueva contraseña">
                                    @error('password')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <label for="password_confirmation" class="form-label">Confirmar Contraseña *</label>
                                    <input type="password" class="form-control" 
                                           id="password_confirmation" wire:model="password_confirmation" placeholder="Confirma tu contraseña">
                                </div>
                            </div>
                        @endif
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <button type="button" class="btn btn-outline-secondary" wire:click="togglePasswordForm">
                                @if($showPasswordForm)
                                    <i class="fas fa-times me-2"></i>Cancelar Cambio de Contraseña
                                @else
                                    <i class="fas fa-key me-2"></i>Cambiar Contraseña
                                @endif
                            </button>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <!-- Información de la Cuenta -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>Información de la Cuenta
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <div class="avatar-placeholder bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                             style="width: 80px; height: 80px; font-size: 2rem;">
                            {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}{{ strtoupper(substr(auth()->user()->last_name, 0, 1)) }}
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Nombre Completo:</strong>
                        <p class="mb-0 text-muted">{{ auth()->user()->full_name }}</p>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Correo:</strong>
                        <p class="mb-0 text-muted">{{ auth()->user()->email }}</p>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Teléfono:</strong>
                        <p class="mb-0 text-muted">{{ auth()->user()->phone ?: 'No especificado' }}</p>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Miembro desde:</strong>
                        <p class="mb-0 text-muted">{{ auth()->user()->created_at->format('d/m/Y') }}</p>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-lightbulb me-2"></i>
                        <small>Mantén tu información actualizada para una mejor experiencia.</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
