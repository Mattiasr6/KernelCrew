<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
     *     description="Retorna lista paginada de cursos publicados con filtros",
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
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Buscar en título o descripción",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="min_price",
     *         in="query",
     *         description="Precio mínimo",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         description="Precio máximo",
     *         @OA\Schema(type="number")
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
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $status = $request->query('status');
        $level = $request->query('level');
        $categoryId = $request->query('category_id');
        $perPage = $request->query('per_page', 10);

        $user = $request->user();
        $isAdminOrInstructor = $user && ($user->isAdmin() || $user->isInstructor());

        $query = Course::with(['instructor', 'category']);

        if (!$isAdminOrInstructor) {
            $query->published();
        } elseif ($status) {
            $query->status($status);
        }

        if ($search) {
            $query->search($search);
        }

        if ($minPrice !== null || $maxPrice !== null) {
            $query->priceBetween((float) $minPrice, (float) $maxPrice);
        }

        if ($level) {
            $query->where('level', $level);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $courses = $query->paginate((int) $perPage);

        $coursesData = collect($courses->items())->map(function ($course) {
            return [
                ...$course->toArray(),
                'price_in_bob' => $course->price_in_bob,
                'price_display' => 'Bs. ' . $course->price_in_bob,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Cursos obtenidos exitosamente',
            'data' => [
                'courses' => $coursesData,
            ],
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ], 200);
    }

    /**
     * Obtener cursos del instructor autenticado
     */
    public function getInstructorCourses(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 10);
        
        $courses = Course::with('instructor')
            ->where('instructor_id', $user->id)
            ->paginate((int) $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Cursos del instructor obtenidos exitosamente',
            'data' => [
                'courses' => $courses->items(),
            ],
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/courses",
     *     tags={"Cursos"},
     *     summary="Crear curso",
     *     description="Crea un nuevo curso (solo instructor/admin)",
     *     operationId="createCourse",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "description", "price"},
     *             @OA\Property(property="title", type="string", example="Curso de PHP"),
     *             @OA\Property(property="description", type="string", example="Descripción del curso..."),
     *             @OA\Property(property="price", type="number", example=299.99)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Curso creado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    #[OA\Post(path: '/api/v1/courses', tags: ['Cursos'], summary: 'Crear curso')]
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $slug = Course::generateSlug($validated['title']);

        $course = Course::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'instructor_id' => $request->user()->id,
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Curso creado exitosamente',
            'data' => $course,
        ], 201);
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

        $user = request()->user();

        if ($course->status !== 'published') {
            $isOwner = $user && $course->instructor_id === $user->id;
            $isAdmin = $user && $user->isAdmin();
            if (!$isOwner && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Curso no encontrado',
                    'data' => null,
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Curso obtenido exitosamente',
            'data' => $course,
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/courses/{id}",
     *     tags={"Cursos"},
     *     summary="Actualizar curso",
     *     description="Actualiza un curso existente (solo instructor/admin)",
     *     operationId="updateCourse",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Curso actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Curso no encontrado")
     * )
     */
    #[OA\Put(path: '/api/v1/courses/{id}', tags: ['Cursos'], summary: 'Actualizar curso')]
    public function update(Request $request, int $id): JsonResponse
    {
        $course = Course::withTrashed()->find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
                'data' => null,
            ], 404);
        }

        $user = $request->user();
        $isOwner = $course->instructor_id === $user->id;
        $isAdmin = $user->isAdmin();

        if (!$isOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para editar este curso',
                'data' => null,
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'min:50'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string', 'in:draft,published'],
        ]);

        if (isset($validated['title']) && $validated['title'] !== $course->title) {
            $validated['slug'] = Course::generateSlug($validated['title']);
        }

        $course->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Curso actualizado exitosamente',
            'data' => $course,
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/courses/{id}",
     *     tags={"Cursos"},
     *     summary="Eliminar curso",
     *     description="SoftDelete de curso",
     *     operationId="deleteCourse",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Curso eliminado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Curso no encontrado")
     * )
     */
    #[OA\Delete(path: '/api/v1/courses/{id}', tags: ['Cursos'], summary: 'Eliminar curso')]
    public function destroy(int $id): JsonResponse
    {
        $course = Course::withTrashed()->find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
                'data' => null,
            ], 404);
        }

        $user = request()->user();
        $isOwner = $course->instructor_id === $user->id;
        $isAdmin = $user->isAdmin();

        if (!$isOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para eliminar este curso',
                'data' => null,
            ], 403);
        }

        if (!$course->trashed()) {
            $course->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Curso eliminado exitosamente',
            'data' => null,
        ], 200);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/courses/{id}/restore",
     *     tags={"Cursos"},
     *     summary="Restaurar curso",
     *     description="Restaura un curso eliminado",
     *     operationId="restoreCourse",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Curso restaurado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    #[OA\Patch(path: '/api/v1/courses/{id}/restore', tags: ['Cursos'], summary: 'Restaurar curso')]
    public function restore(int $id): JsonResponse
    {
        $course = Course::onlyTrashed()->find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
                'data' => null,
            ], 404);
        }

        $course->restore();

        return response()->json([
            'success' => true,
            'message' => 'Curso restaurado exitosamente',
            'data' => null,
        ], 200);
    }

    /**
     * Listar categorías disponibles
     */
    public function categories(): JsonResponse
    {
        $categories = \App\Models\Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }
}
