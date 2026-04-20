<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
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
