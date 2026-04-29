<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserSubscription;
use App\Models\Payment;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Crear una sesión de Checkout de Stripe
     */
    public function createSession(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "Plan {$plan->name} - EduPortal",
                        'description' => $plan->description,
                    ],
                    'unit_amount' => (int) ($plan->price * 100), // Convertir a centavos (2999.00 -> 299900)
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/payment/cancel',
            'client_reference_id' => (string) $user->id,
            'metadata' => [
                'plan_id' => (string) $plan->id,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $session->url
            ]
        ]);
    }

    /**
     * Manejar el Webhook de Stripe
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Manejar el evento de pago exitoso
        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            
            $this->activateSubscription($session);
        }

        return response()->json(['status' => 'success']);
    }

    private function activateSubscription($session)
    {
        $userId = $session->client_reference_id;
        $planId = $session->metadata->plan_id;
        $transactionId = $session->payment_intent;

        $user = User::findOrFail($userId);
        $plan = SubscriptionPlan::findOrFail($planId);

        DB::transaction(function () use ($user, $plan, $transactionId) {
            // 1. Desactivar suscripciones previas
            $user->subscriptions()->where('status', 'active')->update(['status' => 'expired']);

            // 2. Crear nueva suscripción
            $subscription = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'auto_renew' => true
            ]);

            // 3. Registrar el pago real
            Payment::create([
                'user_id' => $user->id,
                'user_subscription_id' => $subscription->id,
                'amount' => (int) ($plan->price * 100),
                'payment_date' => now(),
                'transaction_id' => $transactionId,
                'status' => 'completed',
                'payment_method' => 'stripe'
            ]);

            // 4. Registrar actividad
            Activity::create([
                'user_id' => $user->id,
                'type' => 'subscription_activated',
                'description' => "Te has suscrito al plan {$plan->name} exitosamente.",
            ]);
        });

        Log::info("Suscripción activada vía Stripe para el usuario {$user->email}");
    }
}
