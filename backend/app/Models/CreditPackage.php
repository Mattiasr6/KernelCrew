<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditPackage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'credits_amount', 'price_usd', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price_usd' => 'decimal:2',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
