<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Services\PlanLevelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseAccessController extends Controller
{
    public function __construct(
        private readonly PlanLevelService $planLevelService,
    ) {}

    public function getAccessibleCourses(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->with('plan')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes suscripción activa',
                'data' => [],
            ], 403);
        }

        $courses = Course::published()
            ->with('instructor')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
            'plan_name' => $subscription->plan->name,
            'allowed_levels' => $this->planLevelService->getAllowedLevels($subscription->plan->name),
        ]);
    }

    public function checkAccess(Request $request, int $courseId): JsonResponse
    {
        $user = $request->user();
        $course = Course::findOrFail($courseId);

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->with('plan')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'has_access' => false,
                'reason' => 'Sin suscripción activa',
                'course_level' => $course->level,
            ]);
        }

        $hasAccess = $this->planLevelService->canAccess($subscription->plan->name, $course->level);

        return response()->json([
            'success' => true,
            'has_access' => $hasAccess,
            'course_level' => $course->level,
            'plan_name' => $subscription->plan->name,
            'message' => $hasAccess ? 'Acceso permitido' : 'Tu plan no incluye este nivel',
        ]);
    }

    public function getMyCourses(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrollments = CourseEnrollment::where('user_id', $user->id)
            ->with(['course.instructor'])
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'level' => $enrollment->course->level,
                    'thumbnail' => $enrollment->course->thumbnail,
                    'instructor' => $enrollment->course->instructor,
                    'progress' => $enrollment->progress,
                    'is_completed' => $enrollment->completed_at !== null,
                    'enrollment_date' => $enrollment->enrollment_date,
                    'completed_at' => $enrollment->completed_at,
                ];
            });

        $total = $enrollments->count();
        $completed = $enrollments->where('is_completed', true)->count();
        $inProgress = $total - $completed;

        return response()->json([
            'success' => true,
            'data' => $enrollments,
            'stats' => [
                'total' => $total,
                'completed' => $completed,
                'in_progress' => $inProgress,
            ],
        ]);
    }

    public function markComplete(Request $request, int $courseId): JsonResponse
    {
        $user = $request->user();

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment->update([
            'progress' => 100,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Curso marcado como completado',
            'data' => $enrollment,
        ]);
    }
}
