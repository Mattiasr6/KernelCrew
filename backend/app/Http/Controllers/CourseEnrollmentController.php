<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseEnrollmentController extends Controller
{
    /**
     * Inscribir al usuario en un curso
     */
    public function enroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $course = Course::findOrFail($id);

        // 1. Validar si el usuario tiene una suscripción activa
        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();
        if (!$activeSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Necesitas una suscripción activa para inscribirte en este curso.',
                'redirect_to' => '/subscriptions'
            ], 403);
        }

        // --- LÓGICA DE NIVELES (US-16) ---
        $plan = $activeSubscription->plan;
        $courseLevel = strtolower($course->level);
        $planName = strtolower($plan->name);

        $hasAccess = false;

        $planName = strtolower($plan->name ?? '');

        if (in_array($planName, ['enterprise', 'empresa', 'ilimitado'])) {
            $hasAccess = true; // Acceso total
        } elseif (in_array($planName, ['pro', 'professional', 'profesional'])) {
            // Professional: beginner + intermediate
            $hasAccess = in_array($courseLevel, ['beginner', 'intermediate']);
        } elseif (in_array($planName, ['basic', 'básico'])) {
            // Básico: solo beginner
            $hasAccess = $courseLevel === 'beginner';
        }

        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => "Tu plan {$plan->name} no incluye acceso a cursos de nivel {$course->level}. Por favor, mejora tu suscripción.",
                'redirect_to' => '/subscriptions'
            ], 403);
        }
        // ---------------------------------

        // 2. Validar si ya está inscrito
        $exists = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya estás inscrito en este curso.'
            ], 422);
        }

        // 3. Crear inscripción
        $enrollment = CourseEnrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrollment_date' => now(),
            'progress' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => '¡Inscripción exitosa! Bienvenido al curso.',
            'data' => $enrollment
        ], 201);
    }

    /**
     * Actualizar el progreso del curso
     */
    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'progress' => 'required|integer|min:0|max:100'
        ]);

        $user = $request->user();
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $id)
            ->firstOrFail();

        $enrollment->update([
            'progress' => $request->progress,
            'completed_at' => $request->progress === 100 ? now() : null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Progreso actualizado correctamente.',
            'data' => [
                'progress' => $enrollment->progress,
                'is_completed' => $enrollment->progress === 100
            ]
        ]);
    }

    /**
     * Obtener el estado de inscripción de un curso para el usuario actual
     */
    public function status(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }
}
