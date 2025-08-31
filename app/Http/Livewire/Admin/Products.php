<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Products extends Component
{
    use WithFileUploads, WithPagination;

    public $name, $description, $price, $stock, $images = [];
    public $imageCount = 0;
    public $productId, $isEditing = false;
    public $showModal = false;
    public $search = '';
    public $sortBy = 'created_at';
    public $sortDirection = 'desc';
    public $perPage = 10;

    protected $rules = [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0'
    ];

    protected $messages = [
        'name.required' => 'El nombre del producto es obligatorio.',
        'name.max' => 'El nombre no puede exceder 255 caracteres.',
        'price.required' => 'El precio es obligatorio.',
        'price.numeric' => 'El precio debe ser un número válido.',
        'price.min' => 'El precio no puede ser negativo.',
        'stock.required' => 'El stock es obligatorio.',
        'stock.integer' => 'El stock debe ser un número entero.',
        'stock.min' => 'El stock no puede ser negativo.',
        'images.*.image' => 'Solo se permiten archivos de imagen.',
        'images.*.max' => 'Cada imagen no puede exceder 2MB.'
    ];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function sortBy($field)
    {
        if ($this->sortBy === $field) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortBy = $field;
            $this->sortDirection = 'asc';
        }
    }

    public function openModal()
    {
        $this->resetForm();
        $this->showModal = true;
    }

    public function closeModal()
    {
        $this->showModal = false;
        $this->resetForm();
    }

    public function resetForm()
    {
        $this->name = '';
        $this->description = '';
        $this->price = '';
        $this->stock = '';
        $this->images = [];
        $this->productId = null;
        $this->isEditing = false;
        $this->resetErrorBag();
    }

    public function saveProduct()
    {
        $this->validate();
        
        // Validate only new uploaded images
        if (!empty($this->images)) {
            foreach ($this->images as $index => $image) {
                if (!is_string($image)) {
                    $this->validate([
                        'images.' . $index => 'image|max:2048'
                    ], [
                        'images.' . $index . '.image' => 'Solo se permiten archivos de imagen.',
                        'images.' . $index . '.max' => 'Cada imagen no puede exceder 2MB.'
                    ]);
                }
            }
        }

        $productData = [
            'user_id' => auth()->id(),
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
        ];

        if ($this->isEditing) {
            $product = Product::findOrFail($this->productId);
            $product->update($productData);
            $message = 'Producto actualizado exitosamente.';
        } else {
            $product = Product::create($productData);
            $message = 'Producto creado exitosamente.';
        }

        // Handle image uploads
        if (!empty($this->images)) {
            $imagePaths = [];
            $newImagesUploaded = false;
            
            foreach ($this->images as $image) {
                if (is_string($image)) {
                    // Existing image path
                    $imagePaths[] = $image;
                } else {
                    // New uploaded file
                    $filename = Str::random(20) . '.' . $image->getClientOriginalExtension();
                    $destinationPath = public_path('images/products');
                    
                    // Ensure directory exists
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    
                    // Move the uploaded file
                    $image->storeAs('', $filename, ['disk' => 'public']);
                    $tempPath = storage_path('app/public/' . $filename);
                    $finalPath = $destinationPath . '/' . $filename;
                    
                    if (file_exists($tempPath)) {
                        rename($tempPath, $finalPath);
                    }
                    
                    $imagePaths[] = 'images/products/' . $filename;
                    $newImagesUploaded = true;
                }
            }
            
            if ($this->isEditing && $newImagesUploaded && $product->images) {
                // Delete old images that are no longer in the array
                $oldImages = json_decode($product->images, true);
                $imagesToDelete = array_diff($oldImages, $imagePaths);
                foreach ($imagesToDelete as $oldImage) {
                    $fullPath = public_path($oldImage);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                }
            }
            
            $product->update(['images' => json_encode($imagePaths)]);
        }

        session()->flash('message', $message);
        $this->closeModal();
    }

    public function editProduct($productId)
    {
        $product = Product::findOrFail($productId);
        
        $this->productId = $product->id;
        $this->name = $product->name;
        $this->description = $product->description;
        $this->price = $product->price;
        $this->stock = $product->stock;
        
        // Load existing images
        if ($product->images) {
            $this->images = json_decode($product->images, true);
        } else {
            $this->images = [];
        }
        
        $this->isEditing = true;
        $this->showModal = true;
    }


    
    public function removeImage($index)
    {
        if (isset($this->images[$index])) {
            $imageToRemove = $this->images[$index];
            
            // If it's an existing image (string), delete the physical file
            if (is_string($imageToRemove)) {
                $fullPath = public_path($imageToRemove);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
            
            // Remove the image from the array
            unset($this->images[$index]);
            // Reindex the array to maintain sequential indices
            $this->images = array_values($this->images);
            // Update image count
            $this->imageCount = count($this->images);
            
            // If we're editing a product, update the database immediately
            if ($this->isEditing && $this->productId) {
                $product = Product::find($this->productId);
                if ($product) {
                    $product->images = json_encode($this->images);
                    $product->save();
                }
            }
            
            session()->flash('message', 'Imagen eliminada exitosamente.');
        }
    }

    public function deleteProduct($productId)
    {
        $product = Product::findOrFail($productId);
        
        // Delete associated images
        if ($product->images) {
            $images = json_decode($product->images, true);
            foreach ($images as $image) {
                $fullPath = public_path($image);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
        }
        
        $product->delete();
        session()->flash('message', 'Producto eliminado exitosamente.');
    }

    public function render()
    {
        $products = Product::where('user_id', auth()->id())
            ->when($this->search, function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')
                      ->orWhere('description', 'like', '%' . $this->search . '%');
            })
            ->orderBy($this->sortBy, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.admin.products', compact('products'))
            ->layout('layouts.admin');
    }
}
