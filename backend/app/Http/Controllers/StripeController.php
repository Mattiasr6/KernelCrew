<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
                    'unit_amount' => (int) rtrim((string) $plan->price, '.00'),
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

            $user = User::findOrFail($session->client_reference_id);
            $plan = SubscriptionPlan::findOrFail($session->metadata->plan_id);

            $this->subscriptionService->activate(
                user: $user,
                plan: $plan,
                paymentMethod: 'stripe',
                amount: (float) ($plan->price * 100),
                transactionId: $session->payment_intent,
                registerActivity: true,
            );
        }

        return response()->json(['status' => 'success']);
    }
}
