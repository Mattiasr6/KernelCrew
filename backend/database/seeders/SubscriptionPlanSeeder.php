<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Básico',
                'description' => 'Acceso a 5 cursos básicos',
                'price' => 2999,
                'duration_days' => 30,
                'max_courses' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'description' => 'Acceso ilimitado a todos los cursos',
                'price' => 5999,
                'duration_days' => 30,
                'max_courses' => -1,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'Acceso para equipos con gestión',
                'price' => 9999,
                'duration_days' => 30,
                'max_courses' => -1,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}