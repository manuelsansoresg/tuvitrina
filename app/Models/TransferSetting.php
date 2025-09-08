<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_name',
        'account_holder',
        'account_number',
        'account_type',
        'identification_number',
        'additional_info',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }
}
