<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SubscriptionPayment extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'payment_reference',
        'plan_type',
        'amount',
        'status',
        'payment_method',
        'payment_proof_path',
        'original_filename',
        'payment_date',
        'verified_at',
        'expires_at',
        'admin_notes',
        'rejection_reason',
    ];
    
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($payment) {
            if (empty($payment->payment_reference)) {
                $payment->payment_reference = 'SUB-' . strtoupper(Str::random(10));
            }
        });
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    public function scopeActive($query)
    {
        return $query->where('status', 'completed')
                    ->where('expires_at', '>', now());
    }
    
    public function scopeExpiringSoon($query, $days = 5)
    {
        return $query->where('status', 'completed')
                    ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }
    
    public function getStatusLabelAttribute()
    {
        $labels = [
            'pending' => 'Pendiente',
            'completed' => 'Completado',
            'failed' => 'Fallido',
            'refunded' => 'Reembolsado',
        ];
        
        return $labels[$this->status] ?? $this->status;
    }
    
    public function getPlanTypeLabelAttribute()
    {
        return $this->plan_type === 'monthly' ? 'Mensual' : 'Anual';
    }
    
    public function isExpired()
    {
        return $this->expires_at < now();
    }
    
    public function isExpiringSoon($days = 5)
    {
        return $this->expires_at <= now()->addDays($days) && $this->expires_at > now();
    }
}
