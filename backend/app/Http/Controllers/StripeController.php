<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\CreditPackage;
use App\Models\User;
use App\Models\Payment;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {
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
                    'unit_amount' => (int) $plan->price,
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
                'url' => $session->url,
            ],
        ]);
    }

    /**
     * Crear sesión de Stripe para comprar un paquete de créditos
     */
    public function buyCredits(Request $request): JsonResponse
    {
        $request->validate([
            'credit_package_id' => 'required|exists:credit_packages,id',
        ]);

        $user = $request->user();
        $package = CreditPackage::findOrFail($request->credit_package_id);

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "{$package->name} - {$package->credits_amount} Créditos",
                        'description' => "Paquete de {$package->credits_amount} créditos para KernelLearn",
                    ],
                    'unit_amount' => (int) ($package->price_usd * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/payment/cancel',
            'client_reference_id' => (string) $user->id,
            'metadata' => [
                'type' => 'credit_purchase',
                'user_id' => (string) $user->id,
                'package_id' => (string) $package->id,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => ['url' => $session->url],
        ]);
    }

    /**
     * Manejar el Webhook de Stripe
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $metadata = $session->metadata ?? [];

            if (($metadata['type'] ?? '') === 'credit_purchase') {
                // Compra de créditos
                $user = User::findOrFail($metadata['user_id']);
                $package = CreditPackage::findOrFail($metadata['package_id']);

                DB::transaction(function () use ($user, $package, $session) {
                    $user->increment('credits_balance', $package->credits_amount);

                    Payment::create([
                        'user_id' => $user->id,
                        'credit_package_id' => $package->id,
                        'amount' => $package->price_usd,
                        'payment_date' => now(),
                        'transaction_id' => $session->payment_intent,
                        'payment_method' => 'stripe',
                        'status' => 'completed',
                    ]);

                    Log::info("Créditos otorgados: {$package->credits_amount} a usuario {$user->id}");
                });
            } else {
                // Suscripción (legacy)
                $user = User::findOrFail($session->client_reference_id);
                $plan = SubscriptionPlan::findOrFail($session->metadata->plan_id);

                $this->subscriptionService->activate(
                    user: $user,
                    plan: $plan,
                    paymentMethod: 'stripe',
                    amount: (float) $plan->price,
                    transactionId: $session->payment_intent,
                    registerActivity: true,
                );
            }
        }

        return response()->json(['status' => 'success']);
    }
}
