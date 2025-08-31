<div class="products-container">
    <!-- Header -->
    <div class="page-header">
        <h1 class="page-title">Gestión de Productos</h1>
        <button wire:click="openModal" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nuevo Producto
        </button>
    </div>

    <!-- Flash Messages -->
    @if (session()->has('message'))
        <div class="alert alert-success">
            {{ session('message') }}
        </div>
    @endif

    <!-- Search and Filters -->
    <div class="filters-section">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" wire:model="search" placeholder="Buscar productos..." class="search-input">
        </div>
        <div class="per-page-selector">
            <label>Mostrar:</label>
            <select wire:model="perPage" class="select-input">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
        </div>
    </div>

    <!-- Products Table -->
    <div class="table-container">
        <table class="products-table">
            <thead>
                <tr>
                    <th wire:click="sortBy('name')" class="sortable">
                        Nombre
                        @if($sortBy === 'name')
                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }}"></i>
                        @endif
                    </th>
                    <th>Imagen</th>
                    <th wire:click="sortBy('price')" class="sortable">
                        Precio
                        @if($sortBy === 'price')
                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }}"></i>
                        @endif
                    </th>
                    <th wire:click="sortBy('stock')" class="sortable">
                        Stock
                        @if($sortBy === 'stock')
                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }}"></i>
                        @endif
                    </th>
                    <th wire:click="sortBy('created_at')" class="sortable">
                        Fecha
                        @if($sortBy === 'created_at')
                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }}"></i>
                        @endif
                    </th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                @forelse($products as $product)
                    <tr>
                        <td>
                            <div class="product-name">
                                <strong>{{ $product->name }}</strong>
                                @if($product->description)
                                    <p class="product-description">{{ Str::limit($product->description, 50) }}</p>
                                @endif
                            </div>
                        </td>
                        <td>
                            @if($product->images)
                                @php
                                    $images = json_decode($product->images, true);
                                    $firstImage = $images[0] ?? null;
                                @endphp
                                @if($firstImage)
                                    <img src="{{ asset($firstImage) }}" alt="{{ $product->name }}" class="product-thumbnail">
                                @else
                                    <div class="no-image">Sin imagen</div>
                                @endif
                            @else
                                <div class="no-image">Sin imagen</div>
                            @endif
                        </td>
                        <td class="price">${{ number_format($product->price, 2) }}</td>
                        <td>
                            <span class="stock-badge {{ $product->stock <= 5 ? 'low-stock' : 'normal-stock' }}">
                                {{ $product->stock }}
                            </span>
                        </td>
                        <td>{{ $product->created_at->format('d/m/Y') }}</td>
                        <td>
                            <div class="action-buttons">
                                <button wire:click="editProduct({{ $product->id }})" class="btn btn-sm btn-secondary">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button wire:click="deleteProduct({{ $product->id }})" 
                                        onclick="return confirm('¿Estás seguro de eliminar este producto?')"
                                        class="btn btn-sm btn-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="no-products">
                            <div class="empty-state">
                                <i class="fas fa-box-open"></i>
                                <p>No hay productos registrados</p>
                                <button wire:click="openModal" class="btn btn-primary">Crear primer producto</button>
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    @if($products->hasPages())
        <div class="pagination-wrapper">
            {{ $products->links() }}
        </div>
    @endif

    <!-- Product Modal -->
    @if($showModal)
        <div class="modal-overlay" wire:click="closeModal">
            <div class="modal-content" wire:click.stop>
                <div class="modal-header">
                    <h3>{{ $isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
                    <button wire:click="closeModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form wire:submit.prevent="saveProduct" class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Nombre del Producto *</label>
                            <input type="text" id="name" wire:model="name" class="form-input" placeholder="Ej: Camiseta básica">
                            @error('name') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="description">Descripción</label>
                            <textarea id="description" wire:model="description" class="form-textarea" rows="3" placeholder="Descripción del producto..."></textarea>
                            @error('description') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group half">
                            <label for="price">Precio *</label>
                            <input type="number" id="price" wire:model="price" step="0.01" min="0" class="form-input" placeholder="0.00">
                            @error('price') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group half">
                            <label for="stock">Stock *</label>
                            <input type="number" id="stock" wire:model="stock" min="0" class="form-input" placeholder="0">
                            @error('stock') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="images">Imágenes del Producto</label>
                            
                            @if (session()->has('image_removed'))
                                <div class="alert alert-success">
                                    {{ session('image_removed') }}
                                </div>
                            @endif
                            
                            @if (session()->has('image_error'))
                                <div class="alert alert-danger">
                                    {{ session('image_error') }}
                                </div>
                            @endif
                            
                            <input type="file" id="images" wire:model="images" multiple accept="image/*" class="form-file">
                            <small class="form-help">Puedes seleccionar múltiples imágenes (máx. 2MB cada una)</small>
                            @error('images.*') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                    </div>

                    <!-- Image Preview -->
                    @if($images)
                        <div class="image-preview">
                            <label>Vista previa:</label>
                            <div class="preview-grid">
                                @foreach($images as $index => $image)
                                    <div class="preview-item" wire:key="preview-{{ $index }}-{{ md5(serialize($images)) }}">
                                        @if(is_string($image))
                                            <!-- Existing image -->
                                            <img src="{{ asset($image) }}" alt="Preview">
                                        @else
                                            <!-- New uploaded image -->
                                            <img src="{{ $image->temporaryUrl() }}" alt="Preview">
                                        @endif
                                        <button type="button" class="remove-image-btn" wire:click="removeImage({{ $index }})">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                @endforeach
                                <small class="text-muted">Total: {{ count($images) }} imágenes</small>
                            </div>
                        </div>
                    @endif

                    <div class="modal-footer">
                        <button type="button" wire:click="closeModal" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            {{ $isEditing ? 'Actualizar' : 'Crear' }} Producto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    @endif
</div>

<style>
.products-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.page-title {
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.filters-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 20px;
}

.search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
}

.search-input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.per-page-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.select-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.products-table {
    width: 100%;
    border-collapse: collapse;
}

.products-table th {
    background: #f9fafb;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
}

.products-table th.sortable {
    cursor: pointer;
    user-select: none;
}

.products-table th.sortable:hover {
    background: #f3f4f6;
}

.products-table td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
}

.product-name strong {
    color: #1f2937;
    font-weight: 600;
}

.product-description {
    color: #6b7280;
    font-size: 13px;
    margin: 4px 0 0 0;
}

.product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
}

.no-image {
    width: 50px;
    height: 50px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #6b7280;
}

.price {
    font-weight: 600;
    color: #059669;
    font-size: 16px;
}

.stock-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.normal-stock {
    background: #d1fae5;
    color: #065f46;
}

.low-stock {
    background: #fee2e2;
    color: #991b1b;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.no-products {
    text-align: center;
    padding: 60px 20px;
}

.empty-state i {
    font-size: 48px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-state p {
    color: #6b7280;
    margin-bottom: 20px;
}

.pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
}

.modal-body {
    padding: 20px;
}

.form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
}

.form-group {
    flex: 1;
}

.form-group.half {
    flex: 0.5;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
}

.form-input, .form-textarea, .form-file {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.form-help {
    color: #6b7280;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.error-message {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.image-preview {
    margin-bottom: 20px;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    margin-top: 8px;
}

.preview-item {
    position: relative;
}

.preview-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.remove-image-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(220, 38, 38, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    z-index: 1000;
    pointer-events: auto;
}

.remove-image-btn:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.1);
}

.alert {
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 8px;
    font-size: 14px;
}

.alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-danger {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.alert-success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .filters-section {
        flex-direction: column;
        gap: 12px;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .form-group.half {
        flex: 1;
    }
    
    .modal-content {
        width: 95%;
        margin: 20px;
    }
    
    .products-table {
        font-size: 14px;
    }
    
    .products-table th,
    .products-table td {
        padding: 12px 8px;
    }
}
</style>
