<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
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
}
