<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\UserSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseAccessController extends Controller
{
    /**
     * Verificar si el usuario puede acceder a un curso específico
     */
    public function checkAccess(Request $request, int $courseId): JsonResponse
    {
        $user = $request->user();
        $course = Course::findOrFail($courseId);

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->with('plan')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'has_access' => false,
                'reason' => 'no_active_subscription',
                'message' => 'No tienes una suscripción activa.',
                'redirect_to' => '/subscriptions'
            ], 200);
        }

        $hasAccess = $this->canAccessByPlan($course, $subscription->plan);

        return response()->json([
            'success' => true,
            'has_access' => $hasAccess,
            'course_level' => $course->level,
            'plan_name' => $subscription->plan->name,
            'reason' => $hasAccess ? null : 'plan_level_restricted',
            'message' => $hasAccess 
                ? 'Tienes acceso a este curso.' 
                : "Tu plan {$subscription->plan->name} no incluye cursos de nivel {$course->level}."
        ], 200);
    }

    /**
     * Obtener lista de cursos accesibles según el plan del usuario
     */
    public function getAccessibleCourses(Request $request): JsonResponse
    {
        $user = $request->user();

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->with('plan')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No tienes suscripción activa'
            ], 200);
        }

        $allowedLevels = $this->getAllowedLevels($subscription->plan);

        $courses = Course::published()
            ->whereIn('level', $allowedLevels)
            ->with('instructor:id,name,avatar')
            ->select('id', 'title', 'slug', 'description', 'price', 'level', 'instructor_id', 'created_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $courses,
            'plan_name' => $subscription->plan->name,
            'allowed_levels' => $allowedLevels
        ], 200);
    }

    /**
     * Obtener cursos inscritos por el usuario con progreso
     */
    public function getMyCourses(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrollments = CourseEnrollment::where('user_id', $user->id)
            ->with(['course' => function ($query) {
                $query->select('id', 'title', 'slug', 'description', 'level', 'instructor_id')
                    ->with('instructor:id,name,avatar');
            }])
            ->orderBy('enrollment_date', 'desc')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'description' => $enrollment->course->description,
                    'level' => $enrollment->course->level,
                    'instructor' => $enrollment->course->instructor,
                    'progress' => (float) $enrollment->progress,
                    'is_completed' => $enrollment->progress >= 100,
                    'enrollment_date' => $enrollment->enrollment_date,
                    'completed_at' => $enrollment->completed_at,
                ];
            });

        $completedCount = $enrollments->where('is_completed', true)->count();
        $inProgressCount = $enrollments->where('is_completed', false)->count();

        return response()->json([
            'success' => true,
            'data' => $enrollments,
            'stats' => [
                'total' => $enrollments->count(),
                'completed' => $completedCount,
                'in_progress' => $inProgressCount
            ]
        ], 200);
    }

    /**
     * Marcar curso como completado (usado cuando progress = 100)
     */
    public function markComplete(Request $request, int $courseId): JsonResponse
    {
        $user = $request->user();

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'No estás inscrito en este curso.'
            ], 404);
        }

        if ($enrollment->progress < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Debes completar el 100% del curso para marcarlo como completado.'
            ], 422);
        }

        if ($enrollment->completed_at) {
            return response()->json([
                'success' => true,
                'message' => 'El curso ya estaba marcado como completado.',
                'data' => [
                    'completed_at' => $enrollment->completed_at
                ]
            ], 200);
        }

        $enrollment->update(['completed_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => '¡Felicitaciones! Has completado el curso.',
            'data' => [
                'completed_at' => $enrollment->completed_at
            ]
        ], 200);
    }

    /**
     * Determina si el plan permite acceso al nivel del curso
     */
    private function canAccessByPlan(Course $course, $plan): bool
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

    /**
     * Obtiene los niveles permitidos según el plan
     */
    private function getAllowedLevels($plan): array
    {
        $planName = strtolower($plan->name);

        if ($planName === 'premium' || $planName === 'enterprise') {
            return ['beginner', 'intermediate', 'advanced'];
        }

        if ($planName === 'pro' || $planName === 'professional') {
            return ['beginner', 'intermediate'];
        }

        if ($planName === 'basic' || $planName === 'básico') {
            return ['beginner'];
        }

        return [];
    }
}