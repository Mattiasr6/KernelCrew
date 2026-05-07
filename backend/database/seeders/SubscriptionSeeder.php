<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role_id', 3)->get();
        $plans = SubscriptionPlan::all();

        if ($plans->isEmpty()) {
            $this->command->warn('No hay planes de suscripción. Ejecuta SubscriptionPlanSeeder primero.');
            return;
        }

        // === MATTIAS RIBERA: Premium activa + Básica vencida ===
        $mattias = $students->where('email', 'mattias@kernellearn.com')->first();
        if ($mattias) {
            // Suscripción Básica VENCIDA (hace 2 meses)
            UserSubscription::create([
                'user_id' => $mattias->id,
                'plan_id' => $plans->where('name', 'Básico')->first()?->id,
                'start_date' => Carbon::now()->subMonths(5)->startOfMonth(),
                'end_date' => Carbon::now()->subMonths(2)->startOfMonth(),
                'status' => 'expired',
                'auto_renew' => false,
            ]);

            // Suscripción Premium ACTIVA
            UserSubscription::create([
                'user_id' => $mattias->id,
                'plan_id' => $plans->where('name', 'Enterprise')->first()?->id,
                'start_date' => Carbon::now()->subMonth()->startOfMonth(),
                'end_date' => Carbon::now()->addMonths(2)->endOfMonth(),
                'status' => 'active',
                'auto_renew' => true,
            ]);
        }

        // === OTRAS SUSCRIPCIONES ALEATORIAS ===
        $remainingStudents = $students->where('email', '!=', 'mattias@kernellearn.com');

        foreach ($remainingStudents as $student) {
            // Determinar estado de suscripción
            $rand = rand(1, 100);
            
            if ($rand <= 60) {
                // 60% - Suscripción activa
                $plan = $plans->random();
                $startDate = Carbon::now()->subDays(rand(1, 60));
                $endDate = $startDate->copy()->addDays($plan->duration_days);
                
                UserSubscription::create([
                    'user_id' => $student->id,
                    'plan_id' => $plan->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'active',
                    'auto_renew' => (bool) rand(0, 1),
                ]);
            } elseif ($rand <= 85) {
                // 25% - Suscripción vencida
                $plan = $plans->random();
                $startDate = Carbon::now()->subMonths(rand(3, 6));
                $endDate = $startDate->copy()->addDays($plan->duration_days);
                
                UserSubscription::create([
                    'user_id' => $student->id,
                    'plan_id' => $plan->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'expired',
                    'auto_renew' => false,
                ]);
            }
            // 15% no tiene suscripción
        }

        $activeCount = UserSubscription::where('status', 'active')->count();
        $expiredCount = UserSubscription::where('status', 'expired')->count();
        
        $this->command->info("Suscripciones creadas:");
        $this->command->info("- Activas: {$activeCount}");
        $this->command->info("- Vencidas: {$expiredCount}");
        $this->command->info("- Mattias Ribera: Enterprise activa + Básica vencida");
    }
}