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

        // 1. Calcular progreso hacia el próximo crédito (módulo 3)
        $totalCounted = $user->courses()
            ->withTrashed()
            ->where('is_credit_counted', true)
            ->count();
        
        $progress = $totalCounted % 3;

        // 2. Obtener feed de actividades recientes
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
                    'courses_count' => $user->courses()->count(),
                    'active_students' => 0, // TODO: Implementar tras completar Inscripciones
                ],
                'recent_activity' => $activities
            ]
        ], 200);
    }
}
