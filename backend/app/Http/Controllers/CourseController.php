<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Cursos",
 *     description="Endpoints de cursos"
 * )
 */
#[OA\Tag(name: 'Cursos', description: 'Endpoints de cursos')]
class CourseController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/courses",
     *     tags={"Cursos"},
     *     summary="Listar cursos publicados",
     *     description="Retorna lista paginada de cursos publicados",
     *     operationId="getCourses",
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número de página",
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Elementos por página",
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cursos obtenidos",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items()),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    #[OA\Get(path: '/api/v1/courses', tags: ['Cursos'], summary: 'Listar cursos publicados')]
    public function index(): JsonResponse
    {
        $courses = Course::with('instructor')
            ->where('status', 'published')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Cursos obtenidos exitosamente',
            'data' => $courses->items(),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $course = Course::with('instructor')->find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Curso obtenido exitosamente',
            'data' => $course,
        ], 200);
    }
}
