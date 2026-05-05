<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {}

    /**
     * Listar todos los planes de suscripción (Público)
     */
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'message' => 'Planes obtenidos exitosamente',
            'data' => $plans,
        ]);
    }

    /**
     * Obtener suscripción activa del usuario
     */
    public function getActive(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()
            ->with('plan')
            ->where('status', 'active')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $subscription,
        ]);
    }

    /**
     * Obtener historial de suscripciones del usuario
     */
    public function getHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscriptions = $user->subscriptions()
            ->with('plan', 'payments')
            ->latest('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Historial de suscripciones',
            'data' => [
                'subscriptions' => $subscriptions->items(),
            ],
            'meta' => [
                'total' => $subscriptions->total(),
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
            ],
        ]);
    }

    /**
     * Actualizar auto_renew de una suscripción
     */
    public function updateAutoRenew(Request $request, int $subscriptionId): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'auto_renew' => 'required|boolean',
        ]);

        $subscription = UserSubscription::findOrFail($subscriptionId);

        if ($subscription->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para editar esta suscripción',
            ], 403);
        }

        $subscription->update(['auto_renew' => $request->auto_renew]);

        return response()->json([
            'success' => true,
            'message' => 'Renovación automática ' . ($request->auto_renew ? 'activada' : 'desactivada'),
            'data' => $subscription,
        ]);
    }

    /**
     * Procesar el checkout simulado
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'card_number' => 'required|string',
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        $subscription = $this->subscriptionService->activate(
            user: $user,
            plan: $plan,
            paymentMethod: 'simulated',
            amount: (float) $plan->price,
            transactionId: 'SIM-' . strtoupper(Str::random(10)),
            registerActivity: false,
        );

        return response()->json([
            'success' => true,
            'message' => "¡Suscripción al plan {$plan->name} activada!",
            'data' => [
                'subscription' => $subscription->load('plan'),
                'plan' => $plan,
            ],
        ]);
    }
}
