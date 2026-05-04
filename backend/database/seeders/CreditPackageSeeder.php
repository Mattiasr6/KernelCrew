<?php

namespace Database\Seeders;

use App\Models\CreditPackage;
use Illuminate\Database\Seeder;

class CreditPackageSeeder extends Seeder
{
    public function run(): void
    {
        CreditPackage::create([
            'name' => 'Starter',
            'credits_amount' => 50,
            'price_usd' => 5.00,
            'is_active' => true,
        ]);

        CreditPackage::create([
            'name' => 'Pro',
            'credits_amount' => 150,
            'price_usd' => 12.00,
            'is_active' => true,
        ]);

        CreditPackage::create([
            'name' => 'Master',
            'credits_amount' => 500,
            'price_usd' => 35.00,
            'is_active' => true,
        ]);
    }
}
