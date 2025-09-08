<div>
    @if (session()->has('message'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>{{ session('message') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif
    
    @if($business_name && $this->businessSlug)
        <div class="alert alert-info mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-external-link-alt me-2"></i>
                    <strong>Tu catálogo público está disponible en:</strong>
                </div>
                <a href="{{ route('catalog.show', $this->businessSlug) }}" 
                   target="_blank" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-eye me-2"></i>Ver Catálogo
                </a>
            </div>
            <small class="text-muted d-block mt-2">
                {{ route('catalog.show', $this->businessSlug) }}
            </small>
        </div>
    @endif
    
    <form wire:submit.prevent="saveBusiness">
        <div class="row">
            <!-- Información Básica -->
            <div class="col-md-8">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-store me-2"></i>Información del Negocio
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="business_name" class="form-label">Nombre del Negocio *</label>
                            <input type="text" class="form-control @error('business_name') is-invalid @enderror" 
                                   id="business_name" wire:model="business_name" placeholder="Nombre de tu negocio">
                            @error('business_name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="about" class="form-label">Acerca del Negocio</label>
                            <textarea class="form-control @error('about') is-invalid @enderror" 
                                      id="about" wire:model="about" rows="5" 
                                      placeholder="Describe tu negocio, productos, servicios, historia, etc."></textarea>
                            <div class="form-text">Máximo 2000 caracteres</div>
                            @error('about')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
                
                <!-- Imagen de Portada -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-image me-2"></i>Imagen de Portada
                        </h5>
                    </div>
                    <div class="card-body">
                        @if($current_cover_image)
                            <div class="mb-3">
                                <img src="{{ asset($current_cover_image) }}" 
                                     alt="Portada actual" class="img-fluid rounded" style="max-height: 200px;">
                                <div class="mt-2">
                                    <button type="button" class="btn btn-outline-danger btn-sm" 
                                            wire:click="removeCoverImage" 
                                            onclick="return confirm('¿Estás seguro de eliminar la imagen de portada?')">
                                        <i class="fas fa-trash me-1"></i>Eliminar Imagen
                                    </button>
                                </div>
                            </div>
                        @endif
                        
                        <div class="mb-3">
                            <label for="cover_image" class="form-label">
                                {{ $current_cover_image ? 'Cambiar Imagen de Portada' : 'Subir Imagen de Portada' }}
                            </label>
                            <input type="file" class="form-control @error('cover_image') is-invalid @enderror" 
                                   id="cover_image" wire:model="cover_image" accept="image/*">
                            <div class="form-text">Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB</div>
                            @error('cover_image')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        @if($cover_image)
                            <div class="mt-2">
                                <p class="text-success">
                                    <i class="fas fa-check me-1"></i>Imagen seleccionada: {{ $cover_image->getClientOriginalName() }}
                                </p>
                            </div>
                        @endif
                    </div>
                </div>
                
                <!-- Redes Sociales -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-share-alt me-2"></i>Redes Sociales
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="facebook_url" class="form-label">
                                    <i class="fab fa-facebook text-primary me-2"></i>Facebook
                                </label>
                                <input type="url" class="form-control @error('facebook_url') is-invalid @enderror" 
                                       id="facebook_url" wire:model="facebook_url" 
                                       placeholder="https://facebook.com/tu-negocio">
                                @error('facebook_url')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="instagram_url" class="form-label">
                                    <i class="fab fa-instagram text-danger me-2"></i>Instagram
                                </label>
                                <input type="url" class="form-control @error('instagram_url') is-invalid @enderror" 
                                       id="instagram_url" wire:model="instagram_url" 
                                       placeholder="https://instagram.com/tu-negocio">
                                @error('instagram_url')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="twitter_url" class="form-label">
                                    <i class="fab fa-twitter text-info me-2"></i>Twitter
                                </label>
                                <input type="url" class="form-control @error('twitter_url') is-invalid @enderror" 
                                       id="twitter_url" wire:model="twitter_url" 
                                       placeholder="https://twitter.com/tu-negocio">
                                @error('twitter_url')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Configuración de Pagos -->
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-credit-card me-2"></i>Configuración de Pagos
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="accepts_bank_transfer" 
                                   wire:model="accepts_bank_transfer">
                            <label class="form-check-label" for="accepts_bank_transfer">
                                Aceptar Transferencias Bancarias
                            </label>
                        </div>
                        
                        @if($accepts_bank_transfer)
                            <div class="bank-transfer-fields">
                                <div class="mb-3">
                                    <label for="bank_name" class="form-label">Banco</label>
                                    <input type="text" class="form-control @error('bank_name') is-invalid @enderror" 
                                           id="bank_name" wire:model="bank_name" placeholder="Nombre del banco">
                                    @error('bank_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="mb-3">
                                    <label for="account_holder" class="form-label">Titular de la Cuenta</label>
                                    <input type="text" class="form-control @error('account_holder') is-invalid @enderror" 
                                           id="account_holder" wire:model="account_holder" placeholder="Nombre del titular">
                                    @error('account_holder')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="mb-3">
                                    <label for="account_number" class="form-label">Número de Cuenta</label>
                                    <input type="text" class="form-control @error('account_number') is-invalid @enderror" 
                                           id="account_number" wire:model="account_number" placeholder="Número de cuenta">
                                    @error('account_number')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                
                                <div class="mb-3">
                                    <label for="clabe" class="form-label">CLABE</label>
                                    <input type="text" class="form-control @error('clabe') is-invalid @enderror" 
                                           id="clabe" wire:model="clabe" placeholder="18 dígitos" maxlength="18">
                                    <div class="form-text">Clave Bancaria Estandarizada (18 dígitos)</div>
                                    @error('clabe')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        @endif
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>La información de pago se mostrará a tus clientes cuando realicen compras.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Botón Guardar -->
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-save me-2"></i>Guardar Información del Negocio
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
