<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Instructor - Dashboard",
 *     description="Estadísticas reales de cursos y gamificación"
 * )
 */
#[OA\Tag(name: 'Instructor - Dashboard', description: 'Estadísticas reales de cursos y gamificación')]
class InstructorDashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/instructor/dashboard",
     *     tags={"Instructor - Dashboard"},
     *     summary="Obtener estadísticas reales del instructor",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del dashboard obtenidos",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    #[OA\Get(path: '/api/v1/instructor/dashboard', tags: ['Instructor - Dashboard'], summary: 'Obtener estadísticas reales del instructor')]
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Cursos del instructor
        $courses = $user->courses()->get();
        
        // 2. Total de estudiantes activos (inscritos en cursos publicados del instructor)
        $activeStudents = \App\Models\CourseEnrollment::whereIn('course_id', $courses->pluck('id'))
            ->distinct('user_id')
            ->count('user_id');

        // 3. Calificación promedio de los cursos del instructor
        $totalRating = 0;
        $coursesWithReviews = 0;
        foreach ($courses as $course) {
            $avgRating = $course->reviews()->avg('rating');
            if ($avgRating) {
                $totalRating += $avgRating;
                $coursesWithReviews++;
            }
        }
        $averageRating = $coursesWithReviews > 0 ? round($totalRating / $coursesWithReviews, 1) : 0;

        // 4. Ingresos del instructor (suma de pagos de sus cursos - si aplica)
        $totalEarnings = 0;
        $completedEnrollments = \App\Models\CourseEnrollment::whereIn('course_id', $courses->pluck('id'))
            ->where('progress', '>=', 100)
            ->with('course')
            ->get();
        
        // Calcular ingresos basados en precios de cursos (lógica simplificada)
        foreach ($completedEnrollments as $enrollment) {
            if ($enrollment->course && $enrollment->course->price > 0) {
                $totalEarnings += $enrollment->course->price;
            }
        }

        // 5. Distribución de estudiantes por curso
        $studentsPerCourse = $courses->map(function ($course) {
            return [
                'course_id' => $course->id,
                'course_title' => $course->title,
                'students_count' => $course->enrollments()->count(),
                'completed_count' => $course->enrollments()->where('progress', '>=', 100)->count(),
            ];
        });

        // 6. Progreso hacia el próximo crédito (gamificación)
        $totalCounted = $user->courses()
            ->withTrashed()
            ->where('is_credit_counted', true)
            ->count();
        
        $progress = $totalCounted % 3;

        // 7. Obtener feed de actividades recientes
        $activities = Activity::where('user_id', $user->id)
            ->latest('created_at')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard sincronizado con éxito',
            'data' => [
                'credits_available' => (int) $user->enrollment_credits,
                'gamification' => [
                    'progress_current' => $progress,
                    'progress_target' => 3,
                    'total_history' => $totalCounted
                ],
                'stats' => [
                    'courses_count' => $courses->count(),
                    'active_students' => $activeStudents,
                    'average_rating' => $averageRating,
                    'total_earnings' => $totalEarnings,
                ],
                'courses_distribution' => $studentsPerCourse,
                'recent_activity' => $activities
            ]
        ], 200);
    }
}
