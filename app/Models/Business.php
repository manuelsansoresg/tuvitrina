<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'slug',
        'cover_image',
        'about',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'accepts_bank_transfer',
        'bank_name',
        'account_number',
        'account_holder',
        'clabe',
    ];

    protected $casts = [
        'accepts_bank_transfer' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id', 'user_id');
    }

    public function activeProducts()
    {
        return $this->products()->active()->inStock();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($business) {
            if (empty($business->slug)) {
                $business->slug = $business->generateSlug($business->business_name);
            }
        });

        static::updating(function ($business) {
            if ($business->isDirty('business_name') && empty($business->slug)) {
                $business->slug = $business->generateSlug($business->business_name);
            }
        });
    }

    private function generateSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
