<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'business_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'total_amount',
        'status',
        'payment_proof',
        'notes',
        'order_date',
        'rejection_reason',
        'approved_at',
        'rejected_at',
        'completed_at',
        'sale_id',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'order_date' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(Str::random(8));
            }
            if (empty($order->order_date)) {
                $order->order_date = now();
            }
        });
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    
    public function paymentProof()
    {
        return $this->hasOne(PaymentProof::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaymentUploaded($query)
    {
        return $query->where('status', 'payment_uploaded');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function getStatusLabelAttribute()
    {
        $labels = [
            'pending' => 'Pendiente',
            'payment_uploaded' => 'Comprobante Subido',
            'completed' => 'Completada',
            'cancelled' => 'Cancelada',
        ];

        return $labels[$this->status] ?? $this->status;
    }
}
