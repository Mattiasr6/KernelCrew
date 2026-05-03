<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Course;
use App\Models\UserSubscription;
use App\Services\PlanLevelService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionAccess
{
    public function __construct(
        private readonly PlanLevelService $planLevelService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Debes iniciar sesión.',
            ], 401);
        }

        $subscription = UserSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->with('plan')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Necesitas una suscripción activa.',
                'redirect_to' => '/subscriptions',
                'code' => 'NO_ACTIVE_SUBSCRIPTION',
            ], 403);
        }

        if ($request->is('api/v1/courses/*/enroll')) {
            $courseId = $request->route('id');
            $course = Course::find($courseId);

            if ($course && !$this->planLevelService->canAccess($subscription->plan->name, $course->level)) {
                return response()->json([
                    'success' => false,
                    'message' => "Tu plan {$subscription->plan->name} no incluye acceso a cursos de nivel {$course->level}.",
                    'redirect_to' => '/subscriptions',
                    'code' => 'PLAN_LEVEL_INSUFFICIENT',
                ], 403);
            }
        }

        $request->attributes->set('active_subscription', $subscription);

        return $next($request);
    }
}
