<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserSubscription;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessRenewals extends Command
{
    protected $signature = 'subscriptions:renew';
    protected $description = 'Procesa las renovaciones automáticas de suscripciones vencidas.';

    public function handle()
    {
        $this->info('Iniciando proceso de renovaciones...');

        $subscriptions = UserSubscription::where('auto_renew', true)
            ->where('status', 'active')
            ->where('end_date', '<=', now())
            ->get();

        if ($subscriptions->isEmpty()) {
            $this->info('No hay suscripciones pendientes de renovación.');
            return;
        }

        foreach ($subscriptions as $sub) {
            try {
                DB::transaction(function () use ($sub) {
                    $plan = $sub->plan;

                    // 1. Registrar el pago de renovación
                    Payment::create([
                        'user_id' => $sub->user_id,
                        'subscription_id' => $sub->id,
                        'amount' => $plan->price,
                        'payment_date' => now(),
                        'transaction_id' => 'RENEW-' . strtoupper(Str::random(10)),
                        'status' => 'completed'
                    ]);

                    // 2. Extender la fecha de fin
                    $sub->update([
                        'end_date' => $sub->end_date->addDays($plan->duration_days),
                    ]);
                });

                $this->info("Suscripción #{$sub->id} renovada con éxito.");
            } catch (\Exception $e) {
                $this->error("Error renovando suscripción #{$sub->id}: " . $e->getMessage());
            }
        }

        $this->info('Proceso finalizado.');
    }
}
