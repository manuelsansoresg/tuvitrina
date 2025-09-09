<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'paternal_last_name',
        'maternal_last_name',
        'phone',
        'email',
        'password',
        'selected_plan',
        'subscription_expires_at',
        'subscription_status',
        'last_payment_date',
        'renewal_notification_sent',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
        'last_payment_date' => 'datetime',
        'renewal_notification_sent' => 'boolean',
    ];

    public function business()
    {
        return $this->hasOne(Business::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function subscriptionPayments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }
    
    public function activeSubscriptionPayment()
    {
        return $this->hasOne(SubscriptionPayment::class)
                    ->where('status', 'completed')
                    ->where('expires_at', '>', now())
                    ->latest('expires_at');
    }
    
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->paternal_last_name . ' ' . $this->maternal_last_name);
    }
    
    public function hasActiveSubscription()
    {
        return $this->subscription_status === 'active' && 
               $this->subscription_expires_at && 
               $this->subscription_expires_at > now();
    }
    
    public function isSubscriptionExpired()
    {
        return !$this->subscription_expires_at || $this->subscription_expires_at < now();
    }
    
    public function isSubscriptionExpiringSoon($days = 5)
    {
        if (!$this->subscription_expires_at) {
            return false;
        }
        
        return $this->subscription_expires_at <= now()->addDays($days) && 
               $this->subscription_expires_at > now();
    }
    
    public function getDaysUntilExpirationAttribute()
    {
        if (!$this->subscription_expires_at) {
            return null;
        }
        
        return now()->diffInDays($this->subscription_expires_at, false);
    }
}
