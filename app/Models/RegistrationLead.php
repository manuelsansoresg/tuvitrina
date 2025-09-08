<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'plan_type',
        'amount',
        'payment_proof',
        'status',
        'notes',
        'payment_uploaded_at',
        'approved_at',
        'approved_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_uploaded_at' => 'datetime',
        'approved_at' => 'datetime'
    ];

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaymentUploaded($query)
    {
        return $query->where('status', 'payment_uploaded');
    }
}
