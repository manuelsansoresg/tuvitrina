<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentProof extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'order_id',
        'file_path',
        'original_filename',
        'file_size',
        'mime_type',
        'uploaded_at',
        'status',
        'admin_notes'
    ];
    
    protected $casts = [
        'uploaded_at' => 'datetime',
    ];
    
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
