<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Instructor - Dashboard",
 *     description="Estadísticas de cursos propios para instructores"
 * )
 */
#[OA\Tag(name: 'Instructor - Dashboard', description: 'Estadísticas de cursos propios para instructores')]
class InstructorDashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/instructor/dashboard",
     *     tags={"Instructor - Dashboard"},
     *     summary="Obtener estadísticas del instructor",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas obtenidas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="my_courses_count", type="integer", example=5),
     *                 @OA\Property(property="total_students_enrolled", type="integer", example=300),
     *                 @OA\Property(property="average_rating", type="number", example=4.8)
     *             )
     *         )
     *     )
     * )
     */
    #[OA\Get(path: '/api/v1/instructor/dashboard', tags: ['Instructor - Dashboard'], summary: 'Obtener estadísticas del instructor')]
    public function index(Request $request): JsonResponse
    {
        // TODO: Filtrar por $request->user()->id en la implementación real
        return response()->json([
            'success' => true,
            'message' => 'Estadísticas de instructor obtenidas',
            'data' => [
                'my_courses_count' => 8,
                'total_students_enrolled' => 450,
                'average_rating' => 4.7,
                'active_courses' => 6,
                'pending_reviews' => 12
            ]
        ], 200);
    }
}
