<?php

namespace App\Http\Middleware;

use App\Models\Course;
use App\Models\UserSubscription;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionAccess
{
    /**
     * Handle an incoming request.
     * Verifica que el usuario tenga suscripción activa antes de acceder a cursos.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Debes iniciar sesión.'
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
                'code' => 'NO_ACTIVE_SUBSCRIPTION'
            ], 403);
        }

        // Si es请求 de inscripción a curso específico, verificar nivel
        if ($request->is('api/v1/courses/*/enroll')) {
            $courseId = $request->route('id');
            $course = Course::find($courseId);

            if ($course) {
                $hasAccess = $this->checkPlanLevelAccess($course, $subscription->plan);
                
                if (!$hasAccess) {
                    return response()->json([
                        'success' => false,
                        'message' => "Tu plan {$subscription->plan->name} no incluye acceso a cursos de nivel {$course->level}.",
                        'redirect_to' => '/subscriptions',
                        'code' => 'PLAN_LEVEL_INSUFFICIENT'
                    ], 403);
                }
            }
        }

        // Agregar suscripción al request para uso en controladores
        $request->attributes->set('active_subscription', $subscription);

        return $next($request);
    }

    /**
     * Verifica si el plan permite acceso al nivel del curso
     */
    private function checkPlanLevelAccess(Course $course, $plan): bool
    {
        $planName = strtolower($plan->name);
        $courseLevel = $course->level;

        if ($planName === 'premium' || $planName === 'enterprise') {
            return true;
        }

        if ($planName === 'pro' || $planName === 'professional') {
            return in_array($courseLevel, ['beginner', 'intermediate']);
        }

        if ($planName === 'basic' || $planName === 'básico') {
            return $courseLevel === 'beginner';
        }

        return false;
    }
}