<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\CourseEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseReviewController extends Controller
{
    /**
     * Listar reseñas de un curso y su promedio
     */
    public function index(Request $request, int $courseId): JsonResponse
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
                'data' => null,
            ], 404);
        }

        $user = $request->user();

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
        
        $reviews = $course->reviews()->with('user:id,name,avatar')->latest()->get();
        $average = $course->reviews()->avg('rating') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'average_rating' => round($average, 1),
                'total_reviews' => $reviews->count(),
            ]
        ]);
    }

    /**
     * Guardar una nueva reseña
     */
    public function store(Request $request, int $courseId): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // 1. Validar inscripción (CourseEnrollment)
        $isEnrolled = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();

        if (!$isEnrolled) {
            return response()->json([
                'success' => false,
                'message' => 'Debes estar inscrito en el curso para dejar una reseña.'
            ], 403);
        }

        // 2. Evitar duplicados (Unique index en la tabla refuerza esto)
        $alreadyReviewed = CourseReview::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'success' => false,
                'message' => 'Ya has calificado este curso anteriormente.'
            ], 422);
        }

        $review = CourseReview::create([
            'user_id' => $user->id,
            'course_id' => $courseId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => '¡Gracias por tu reseña!',
            'data' => $review
        ], 201);
    }
}
