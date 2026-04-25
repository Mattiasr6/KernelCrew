<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Administración - Dashboard",
 *     description="Estadísticas globales para el administrador"
 * )
 */
#[OA\Tag(name: 'Administración - Dashboard', description: 'Estadísticas globales para el administrador')]
class AdminDashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard",
     *     tags={"Administración - Dashboard"},
     *     summary="Obtener estadísticas globales",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas obtenidas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total_users", type="integer", example=150),
     *                 @OA\Property(property="active_students", type="integer", example=120),
     *                 @OA\Property(property="total_courses", type="integer", example=45),
     *                 @OA\Property(property="total_revenue", type="number", example=1500.50)
     *             )
     *         )
     *     )
     * )
     */
    #[OA\Get(path: '/api/v1/admin/dashboard', tags: ['Administración - Dashboard'], summary: 'Obtener estadísticas globales')]
    public function index(): JsonResponse
    {
        // TODO: Implementar consultas reales con Eloquent en la siguiente iteración
        return response()->json([
            'success' => true,
            'message' => 'Estadísticas globales obtenidas',
            'data' => [
                'total_users' => 150,
                'active_students' => 120,
                'total_courses' => 45,
                'total_revenue' => 1500.50,
                'recent_registrations' => 15,
            ]
        ], 200);
    }
}
