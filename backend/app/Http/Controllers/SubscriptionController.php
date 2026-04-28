<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Listar todos los planes de suscripción
     */
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::all();
        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Procesar el checkout simulado
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'card_number' => 'required|string', // Solo simulación
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        return DB::transaction(function () use ($user, $plan) {
            // 1. Desactivar suscripciones anteriores si existen
            $user->subscriptions()->where('status', 'active')->update(['status' => 'expired']);

            // 2. Crear la nueva suscripción
            $subscription = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'auto_renew' => true
            ]);

            // 3. Registrar el pago simulado
            Payment::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'amount' => $plan->price,
                'payment_date' => now(),
                'transaction_id' => 'SIM-' . strtoupper(Str::random(10)),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => "¡Suscripción al plan {$plan->name} activada!",
                'data' => [
                    'subscription' => $subscription,
                    'plan' => $plan
                ]
            ]);
        });
    }
}
